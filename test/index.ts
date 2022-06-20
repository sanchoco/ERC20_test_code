import { waffle } from "hardhat";
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
    const [admin, user1, user2, user3, user4] = provider.getWallets();

    beforeEach(async () => {
        token = (await deployContract(admin, TokenArtifact, [
            name,
            symbol,
            totalSupply,
            18
        ])) as Token;
    });

    it("Check default token data", async () => {
        expect(await token.name()).to.be.equal(name);
        expect(await token.symbol()).to.be.equal(symbol);
        expect(await token.decimals()).to.be.equal(18);
        expect(await token.totalSupply()).to.be.equal(totalSupply);
    });
});
