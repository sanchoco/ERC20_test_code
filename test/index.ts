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
        token = (await deployContract(owner, TokenArtifact, [name, symbol, totalSupply, 18])) as Token;
    });

    // Default
    context("Check infomation", async () => {
        it("name", async () => {
            expect(await token.name()).to.equal(name);
        });

        it("symbol", async () => {
            expect(await token.symbol()).to.equal(symbol);
        });

        it("decimals", async () => {
            expect(await token.decimals()).to.equal(18);
        });

        it("totalSupply", async () => {
            expect(await token.totalSupply()).to.equal(totalSupply);
        });

        it("balance", async () => {
            expect(await token.balanceOf(owner.address)).to.be.equal(totalSupply);
        });
    });

    // Transfer
    context("Transfer test", async () => {
        it("transfer to EOA", async () => {
            await expect(() => token.transfer(user1.address, 200)).to.changeTokenBalance(token, user1, 200);
        });

        it("transfer to zero address -> fail", async () => {
            await expect(token.transfer(ethers.constants.AddressZero, 100)).to.revertedWith(
                "ERC20: transfer to the zero address"
            );
        });

        it("transfer more values than balance -> fail", async () => {
            await expect(() => token.transfer(user1.address, totalSupply)).to.changeTokenBalance(
                token,
                user1,
                totalSupply
            );
            await expect(token.transfer(user1.address, 1)).to.revertedWith("ERC20: transfer amount exceeds balance");
        });

        it("catch transfer event", async () => {
            await expect(token.transfer(user1.address, 50))
                .to.emit(token, "Transfer")
                .withArgs(owner.address, user1.address, 50);
        });
    });

    // Approve
    context("Approve test", async () => {
        const getAddress = ethers.utils.getAddress;
        const conA = "0xc6a2ad8cc6e4a7e08fc37cc5954be07d499e7654";
        const conB = "0xc6a2ad8cc6e4a7e08fc37cc5954be07d499e7651";
        const conC = "0xc6a2ad8cc6e4a7e08fc37cc5954be07d499e7650";
        it("catch approve event", async () => {
            await expect(token.approve(getAddress(conA), 10000))
                .to.emit(token, "Approval")
                .withArgs(owner.address, getAddress(conA), 10000);
        });

        it("check allowance", async () => {
            await token.approve(conB, 7000);
            expect(await token.allowance(owner.address, conB)).to.equal(7000);
            expect(await token.allowance(owner.address, conC)).to.equal(0);
        });

        it("increase allowance", async () => {
            await token.approve(conA, 1000);
            expect(await token.allowance(owner.address, conA)).to.equal(1000);
            await token.increaseAllowance(conA, 1000);
            expect(await token.allowance(owner.address, conA)).to.equal(2000);
        });

        it("increase allowance to zero address -> fail ", async () => {
            await token.transfer(user1.address, 100);
            await expect(token.connect(user1).increaseAllowance(ethers.constants.AddressZero, 100)).to.revertedWith(
                "ERC20: approve to the zero address"
            );
        });

        it("decrease allowance", async () => {
            await token.transfer(user1.address, 100);
            await token.connect(user1).approve(conA, 100);
            await token.connect(user1).decreaseAllowance(conA, 10);
            expect(await token.allowance(user1.address, conA)).to.equal(90);
        });

        it("decrease more allowance -> fail", async () => {
            await token.transfer(user1.address, 100);
            await token.connect(user1).approve(conA, 100);
            await expect(token.connect(user1).decreaseAllowance(conA, 101)).to.revertedWith(
                "ERC20: decreased allowance below zero"
            );
        });

        it("decrease to zero -> fail", async () => {
            await token.transfer(user1.address, 100);
            await expect(token.connect(user1).decreaseAllowance(ethers.constants.AddressZero, 0)).to.revertedWith(
                "ERC20: approve to the zero address"
            );
        });
    });
});
