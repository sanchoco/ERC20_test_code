import { ethers, waffle } from "hardhat";
import { expect } from "chai";
// eslint-disable-next-line node/no-missing-import
import { Token } from "../typechain";
import TokenArtifact from "../artifacts/contracts/Token.sol/Token.json";
import { deployContract } from "ethereum-waffle";

describe("ERC20 Token", async () => {
    let token: Token;
    const name = "ERC20 TEST TOKEN";
    const symbol = "ETT";
    const totalSupply = "10000000000000000000000";

    const provider = waffle.provider;

    // eslint-disable-next-line no-unused-vars
    const [owner, user1, user2, user3] = provider.getWallets();

    beforeEach(async () => {
        token = (await deployContract(owner, TokenArtifact, [
            name,
            symbol,
            totalSupply,
            18
        ])) as Token;
    });

    // Default
    context("Check infomation", async () => {
        it("token name", async () => {
            expect(await token.name()).to.equal(name);
        });

        it("token symbol", async () => {
            expect(await token.symbol()).to.equal(symbol);
        });

        it("token decimals", async () => {
            expect(await token.decimals()).to.equal(18);
        });

        it("token totalSupply", async () => {
            expect(await token.totalSupply()).to.equal(totalSupply);
        });

        it("admin balance", async () => {
            expect(await token.balanceOf(owner.address)).to.be.equal(
                totalSupply
            );
        });
    });

    // Transfer
    context("Transfer test", async () => {
        it("transfer to EOA", async () => {
            await expect(() =>
                token.transfer(user1.address, 200)
            ).to.changeTokenBalance(token, user1, 200);
        });

        it("transfer to zero address", async () => {
            await expect(
                token.transfer(ethers.constants.AddressZero, 100)
            ).to.revertedWith("ERC20: transfer to the zero address");
        });

        it("transfer more values than balance", async () => {
            await expect(() =>
                token.transfer(user1.address, totalSupply)
            ).to.changeTokenBalance(token, user1, totalSupply);
            await expect(token.transfer(user1.address, 1)).to.revertedWith(
                "ERC20: transfer amount exceeds balance"
            );
        });

        it("catch transfer event", async () => {
            await expect(token.transfer(user1.address, 50))
                .to.emit(token, "Transfer")
                .withArgs(owner.address, user1.address, 50);
        });
    });

    context("Approve test", async () => {
        const getAddress = ethers.utils.getAddress;
        it("catch approve event", async () => {
            await expect(
                token.approve(
                    getAddress("0xc6a2ad8cc6e4a7e08fc37cc5954be07d499e7654"),
                    10000
                )
            )
                .to.emit(token, "Approval")
                .withArgs(
                    owner.address,
                    getAddress("0xc6a2ad8cc6e4a7e08fc37cc5954be07d499e7654"),
                    10000
                );
        });
    });
});
