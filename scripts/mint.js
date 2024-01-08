const hre = require("hardhat");

async function main() {
  // Вибір контракту та рахунку для мінтингу
  const [deployer] = await hre.ethers.getSigners();
  const Token = await hre.ethers.getContractFactory("VINCoin");
  const token = await Token.attach("0x62f1EFD105aB29674ADd9BcC3Ff17305040d685e"); // Адреса вашого контракту

  // Мінтинг токенів
  const mintTx = await token.mint(deployer.address, hre.ethers.parseUnits("1000", 14)); // Мінтинг 1000 токенів
  await mintTx.wait();
  
  console.log(`Мінтинг 1000 токенів на адресу ${deployer.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
