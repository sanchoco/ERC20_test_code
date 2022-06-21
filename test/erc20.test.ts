import { ethers, waffle } from "hardhat";
import { deployContract } from "ethereum-waffle";
import { expect } from "chai";

import ERC20TokenArtifact from "../artifacts/contracts/ERC20_Token.sol/ERC20Token.json";
// eslint-disable-next-line node/no-missing-import
import { ERC20Token } from "../typechain";

describe("ERC20 test", async () => {
    let token: ERC20Token;
    const name = "ERC20 TEST TOKEN";
    const symbol = "ETT";
    const totalSupply = "10000000000000000000000";

    const provider = waffle.provider;

    // eslint-disable-next-line no-unused-vars
    const [owner, user1, user2, user3] = provider.getWallets();

    beforeEach(async () => {
        token = (await deployContract(owner, ERC20TokenArtifact, [name, symbol, totalSupply, 18])) as ERC20Token;
    });

    // Default
    context("Infomation", async () => {
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
    context("Transfer", async () => {
        it("Transfer to EOA must be success.", async () => {
            await expect(() => token.transfer(user1.address, 200)).to.changeTokenBalance(token, user1, 200);
        });

        it("Transfer to zero address must be fail.", async () => {
            await expect(token.transfer(ethers.constants.AddressZero, 100)).to.revertedWith(
                "ERC20: transfer to the zero address"
            );
        });

        it("Transfer more balance must be fail.", async () => {
            await expect(() => token.transfer(user1.address, totalSupply)).to.changeTokenBalance(
                token,
                user1,
                totalSupply
            );
            await expect(token.transfer(user1.address, 1)).to.revertedWith("ERC20: transfer amount exceeds balance");
        });

        it("Transfer must be catch event.", async () => {
            await expect(token.transfer(user1.address, 50))
                .to.emit(token, "Transfer")
                .withArgs(owner.address, user1.address, 50);
        });
    });

    // Approve
    context("Approve", async () => {
        const getAddress = ethers.utils.getAddress;
        const conA = "0xc6a2ad8cc6e4a7e08fc37cc5954be07d499e7654";
        const conB = "0xc6a2ad8cc6e4a7e08fc37cc5954be07d499e7651";
        const conC = "0xc6a2ad8cc6e4a7e08fc37cc5954be07d499e7650";
        it("Approve must be catch event", async () => {
            await expect(token.approve(getAddress(conA), 10000))
                .to.emit(token, "Approval")
                .withArgs(owner.address, getAddress(conA), 10000);
        });

        it("Approve is other contracts not affected.", async () => {
            await token.approve(conB, 7000);
            expect(await token.allowance(owner.address, conB)).to.equal(7000);
            expect(await token.allowance(owner.address, conC)).to.equal(0);
        });

        it("Approve and increase allowance must be success.", async () => {
            await token.approve(conA, 1000);
            expect(await token.allowance(owner.address, conA)).to.equal(1000);
            await token.increaseAllowance(conA, 1000);
            expect(await token.allowance(owner.address, conA)).to.equal(2000);
        });

        it("Increase zero address must be fail. ", async () => {
            await token.transfer(user1.address, 100);
            await expect(token.connect(user1).increaseAllowance(ethers.constants.AddressZero, 100)).to.revertedWith(
                "ERC20: approve to the zero address"
            );
        });

        it("Decrease allowance must be success.", async () => {
            await token.transfer(user1.address, 100);
            await token.connect(user1).approve(conA, 100);
            await token.connect(user1).decreaseAllowance(conA, 10);
            expect(await token.allowance(user1.address, conA)).to.equal(90);
        });

        it("Allowance can not be less than 0.", async () => {
            await token.transfer(user1.address, 100);
            await token.connect(user1).approve(conA, 100);
            await expect(token.connect(user1).decreaseAllowance(conA, 101)).to.revertedWith(
                "ERC20: decreased allowance below zero"
            );
        });

        it("Zero address can not decrease allowance.", async () => {
            await token.transfer(user1.address, 100);
            await expect(token.connect(user1).decreaseAllowance(ethers.constants.AddressZero, 0)).to.revertedWith(
                "ERC20: approve to the zero address"
            );
        });
    });

    context("Approve & TransferFrom", async () => {
        it("Approve and Delegate transfer must be success.", async () => {
            await token.transfer(user1.address, 1000);
            await token.connect(user1).approve(user2.address, 1000);
            await token.connect(user2).transferFrom(user1.address, user3.address, 100);
            expect(await token.balanceOf(user1.address)).to.equal(900);
            expect(await token.balanceOf(user3.address)).to.equal(100);
        });

        it("Not approved user is transferFrom must be fail.", async () => {
            await token.transfer(user1.address, 1000);
            await token.connect(user1).approve(user2.address, 1000);
            await expect(token.connect(user3).transferFrom(user1.address, user3.address, 100)).to.revertedWith(
                "ERC20: insufficient allowance"
            );
        });

        it("More than approved amount will be fail.", async () => {
            await token.transfer(user1.address, 1000);
            await token.connect(user1).approve(user2.address, 100);
            await expect(token.connect(user2).transferFrom(user1.address, user2.address, 200)).to.revertedWith(
                "ERC20: insufficient allowance"
            );
        });

        it("More than balance will be fail.", async () => {
            await token.transfer(user1.address, 1000);
            await token.connect(user1).approve(user2.address, 5000);
            await expect(token.connect(user2).transferFrom(user1.address, user2.address, 2000)).to.revertedWith(
                "ERC20: transfer amount exceeds balance"
            );
        });
    });
});
