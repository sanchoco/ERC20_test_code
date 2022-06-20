import { ethers } from "hardhat";

async function main() {
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(
        "ERC20 TEST TOKEN",
        "ETT",
        "10000000000000000000000", // 10000
        18
    );

    await token.deployed();

    console.log("ERC20 Token deployed to:", token.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
