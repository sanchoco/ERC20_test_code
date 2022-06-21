import { ethers, waffle } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { ERC721Token } from "../typechain";
import ERC721TokenArtifact from "../artifacts/contracts/ERC721_Token.sol/ERC721Token.json";
import { deployContract } from "ethereum-waffle";
import { expect } from "chai";

describe("ERC721 test", async () => {
    let nft: ERC721Token;
    const provider = waffle.provider;
    // eslint-disable-next-line no-unused-vars
    const [owner, user1, user2, user3] = provider.getWallets();

    const name = "ERC721 TEST NFT";
    const symbol = "ENFT";
    const baseUri = "http://sancho.test/";

    beforeEach(async () => {
        nft = (await deployContract(owner, ERC721TokenArtifact, [name, symbol, baseUri])) as ERC721Token;
    });

    context("Infomation", async () => {
        it("name", async () => {
            expect(await nft.name()).to.equal(name);
        });
        it("symbol", async () => {
            expect(await nft.symbol()).to.equal(symbol);
        });
        it("supportsInterface", async () => {
            expect(await nft.supportsInterface("0x80ac58cd")).to.equal(true);
        });
    });

    context("Mint", async () => {
        it("Owner can mint.", async () => {
            expect(await nft.mint(user1.address))
                .to.be.emit(nft, "Transfer")
                .withArgs(ethers.constants.AddressZero, user1.address, 0);
        });
        it("Minted token can call ownerOf function", async () => {
            await nft.mint(owner.address);
            expect(await nft.ownerOf(0)).to.equal(owner.address);
        });
        it("Minted token has tokenUri", async () => {
            await nft.mint(owner.address);
            expect(await nft.tokenURI(0)).to.equal(baseUri + 0);
        });
        it("Common user can not mint.", async () => {
            await expect(nft.connect(user1).mint(user1.address)).to.revertedWith(
                "ERC721PresetMinterPauserAutoId: must have minter role to mint"
            );
        });
    });

    context("Pause", async () => {
        it("Paused token can not mint.", async () => {
            await nft.pause();
            expect(await nft.paused()).to.equal(true);
            expect(nft.mint(user1.address)).to.revertedWith("ERC721Pausable: token transfer while paused");
        });
        it("Unpaused token can mint.", async () => {
            await nft.pause();
            expect(await nft.paused()).to.equal(true);
            await nft.unpause();
            expect(await nft.paused()).to.equal(false);
            await nft.mint(user1.address);
            expect(await nft.ownerOf(0)).to.equal(user1.address);
        });
        it("Common user can not pause.", async () => {
            await expect(nft.connect(user1).pause()).to.revertedWith(
                "ERC721PresetMinterPauserAutoId: must have pauser role to pause"
            );
        });
        it("Common user can not unpause.", async () => {
            await nft.pause();
            await expect(nft.connect(user1).unpause()).to.revertedWith(
                "ERC721PresetMinterPauserAutoId: must have pauser role to unpause"
            );
        });
        it("Paused token can not transfer.", async () => {
            await nft.mint(owner.address);
            await nft.pause();
            await expect(nft.transferFrom(owner.address, user1.address, 0)).to.revertedWith(
                "ERC721Pausable: token transfer while paused"
            );
        });
    });

    context("Approve", async () => {
        it("Approved user can be transfer nft.", async () => {
            await nft.mint(user1.address);
            await nft.connect(user1).approve(user2.address, 0);
            expect(await nft.ownerOf(0)).to.equal(user1.address);
            expect(await nft.connect(user2).transferFrom(user1.address, user3.address, 0))
                .to.be.emit(nft, "Transfer")
                .withArgs(user1.address, user3.address, 0);
        });

        it("Not approved user can not transfer nft.", async () => {
            await nft.mint(user1.address);
            await nft.connect(user1).approve(user3.address, 0);
            expect(await nft.ownerOf(0)).to.equal(user1.address);
            await expect(nft.connect(user2).transferFrom(user1.address, user3.address, 0)).to.revertedWith(
                "ERC721: transfer caller is not owner nor approved"
            );
        });
        it("SetApprovalForAll can be transfer nft anything.", async () => {
            await nft.mint(user1.address);
            await nft.mint(user1.address);
            await nft.connect(user1).setApprovalForAll(user2.address, true);
            expect(await nft.connect(user2).transferFrom(user1.address, user3.address, 0))
                .to.be.emit(nft, "Transfer")
                .withArgs(user1.address, user3.address, 0);
            expect(await nft.connect(user2).transferFrom(user1.address, user3.address, 1))
                .to.be.emit(nft, "Transfer")
                .withArgs(user1.address, user3.address, 1);
        });
    });
});
