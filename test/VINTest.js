const { expect } = require("chai");
const { ethers } = require("hardhat");

  describe("VINCoin Tests", function() {
    let vinc, owner, other, user, sender, recipient, ico, rate, mintAmount;
    
    beforeEach(async function () {
      // Отримуємо аккаунти
      [owner, other, sender, recipient, user] = await ethers.getSigners();
      // console.log("User in beforeEach:", user.address);
      
      });   

//1.totalSupply() токенів при завантаженні контракту дорівнює 0
  it("totalSupply() should be 0 when the contract is deployed", async function() {
    const VINCoin = await ethers.getContractFactory("VINCoin");
    const vinc = await VINCoin.deploy();

    const totalSupply = await vinc.totalSupply();
    // console.log(`totalSupply after deployment: ${totalSupply}`);
    expect(totalSupply).to.equal(0);
  });

//2. При виконанні transfer() у відправника коректно зменшується баланс і у отримувача – збільшується
it("transfer() should correctly decrease sender's balance and increase recipient's balance", async function () {
  const [owner, recipient] = await ethers.getSigners();
  const VINCoin = await ethers.getContractFactory("VINCoin");
  const vinc = await VINCoin.deploy();

  // Минула чеканка токенів у цьому тесті
  const initialMintAmount = ethers.parseEther("1000");
  await vinc.mint(owner.address, initialMintAmount);

  // Отримання початкового балансу відправника та отримувача
  const initialOwnerBalance = await vinc.balanceOf(owner.address);
  const initialRecipientBalance = await vinc.balanceOf(recipient.address);

  // Кількість токенів для переказу
  const transferAmount = ethers.parseEther("100");
  const transferTx = await vinc.connect(owner).transfer(recipient.address, transferAmount);

  // Очікування на виконання транзакції
  await transferTx.wait();

  // Отримання та порівняння балансів після переказу
  const finalOwnerBalance = await vinc.balanceOf(owner.address);
  const finalRecipientBalance = await vinc.balanceOf(recipient.address);

  const expectedFinalOwnerBalance = initialOwnerBalance - (transferAmount);
  const expectedFinalRecipientBalance = initialRecipientBalance + (transferAmount);

  expect(finalOwnerBalance).to.equal(expectedFinalOwnerBalance);
  expect(finalRecipientBalance).to.equal(expectedFinalRecipientBalance);
});

//3. При виконанні approve() у отримувача коректно змінюється allowance()
it("approve() should correctly change allowance of the recipient", async function () {
  const [owner, recipient] = await ethers.getSigners();
  const VINCoin = await ethers.getContractFactory("VINCoin");
  const vinc = await VINCoin.deploy();

  // Встановлення початкового дозволу
  const initialAllowance = ethers.parseEther("0");
  await vinc.connect(owner).approve(recipient.address, initialAllowance);

  // Отримання початкового дозволу
  const initialRecipientAllowance = await vinc.allowance(owner.address, recipient.address);

  // Встановлення нового дозволу
  const newAllowance = ethers.parseEther("100");
  await vinc.connect(owner).approve(recipient.address, newAllowance);

  // Отримання та порівняння нового дозволу
  const finalRecipientAllowance = await vinc.allowance(owner.address, recipient.address);

  expect(finalRecipientAllowance).to.equal(newAllowance);
});

//4.При виконанні transferFrom() користувачем (отримувачем), якому раніше було дозволено використання токенів
    //іншого користувача(відправника), у відправника коректно зменшується баланс і у отримувача – збільшується”;
it("transferFrom() should correctly transfer tokens when allowance is given", async function () {
  const [owner, sender, recipient] = await ethers.getSigners();
  const VINCoin = await ethers.getContractFactory("VINCoin");
  const vinc = await VINCoin.deploy();

  const initialMintAmount = ethers.parseEther("1000"); // Використовуйте utils.parseEther() для створення BigNumber
  await vinc.mint(sender.address, initialMintAmount);

  const transferAmount = ethers.parseEther("100"); // Використовуйте utils.parseEther() для створення BigNumber
  await vinc.connect(sender).approve(recipient.address, transferAmount);

  await vinc.connect(recipient).transferFrom(sender.address, recipient.address, transferAmount);

  const finalSenderBalance = await vinc.balanceOf(sender.address);
  const recipientBalance = await vinc.balanceOf(recipient.address);

  const expectedFinalSenderBalance = initialMintAmount - (transferAmount);
  const expectedRecipientBalance = transferAmount;

  expect(finalSenderBalance).to.equal(expectedFinalSenderBalance);
  expect(recipientBalance).to.equal(expectedRecipientBalance);
});

//5.Користувач без достатнього allowance не може виконувати transferFrom токенами іншого користувача
it("user without sufficient allowance cannot perform transferFrom of another user's tokens", async function() {
  const VINCoin = await ethers.getContractFactory("VINCoin");
  const vinc = await VINCoin.deploy();

  const mintAmount = ethers.parseEther("100");
  await vinc.mint(sender.address, mintAmount); // Чеканення токенів для sender

  const allowanceAmount = ethers.parseEther("10");
  await vinc.connect(sender).approve(recipient.address, allowanceAmount); // Встановлення allowance

  const transferAmount = ethers.parseEther("20");

  await expect(vinc.connect(recipient).transferFrom(sender.address, recipient.address, transferAmount)).to.be.reverted;
  
});

// 6. При виконанні burn() у користувача коректно зменшується баланс”
it("should correctly decrease user's balance after burn()", async function() {
  const VINCoin = await ethers.getContractFactory("VINCoin");
  const vinc = await VINCoin.deploy();

  await vinc.mint(owner.address, ethers.parseEther("10000.0")); // Начеканення токенів для власника
  await vinc.mint(user.address, ethers.parseEther("100")); // Начеканення токенів для користувача

  const initialBalance = await vinc.balanceOf(user.address);

  await vinc.connect(user).burn(ethers.parseEther("10"));
  const finalBalance = await vinc.balanceOf(user.address);

  const expectedFinalBalance = initialBalance - ethers.parseEther("10");
  expect(finalBalance).to.equal(expectedFinalBalance);
});

// 7. owner смарт-контракту співпадає із користувачем, що завантажив контракт
it("wner of the smart contract should match the address of the deployer", async function() {
  // Розгортання контракту VINCoin
  const VINCoin = await ethers.getContractFactory("VINCoin");
  vinc = await VINCoin.deploy();
    // Отримуємо адресу власника контракту
    const contractOwner = await vinc.owner();

    // Перевірка, що адреса власника контракту співпадає з адресою деплоєра
    expect(contractOwner).to.equal(owner.address);
});

// 8. Тільки owner може чеканити нові токени
it("only owner can mint tokens", async function () {
  const [owner, other] = await ethers.getSigners();
  const VINCoin = await ethers.getContractFactory("VINCoin");
  const vinc = await VINCoin.deploy();

  const mintAmount = ethers.parseEther("10000.0");

  // Спроба owner чеканити токени
  await vinc.mint(owner.address, mintAmount);

  const ownerBalance = await vinc.balanceOf(owner.address);
  // console.log(`Owner's balance: ${ethers.formatEther(ownerBalance)} VIN`);
  expect(ownerBalance).to.equal(mintAmount);

});

//9. Інші користувачі не можуть чеканити нові токени
it("Others can't mint tokens", async function () {
  // Отримуємо кілька аккаунтів
  const [owner, other] = await ethers.getSigners();
  const VINCoin = await ethers.getContractFactory("VINCoin");

  // Розгортаємо контракт з власника
  const vinc = await VINCoin.deploy();

  const mintAmount = ethers.parseEther("100.0");

  // Спроба іншою адресою (не власником) чеканити токени
  await expect(vinc.connect(other).mint(other.address, mintAmount))
  .to.be.reverted;

});

// 10. Немає способу збільшити _totalSupply понад значення _cap
it("Cannot mint tokens beyond cap", async function () {
  const [owner] = await ethers.getSigners();
  const VINCoin = await ethers.getContractFactory("VINCoin");
  const vinc = await VINCoin.deploy();

  const cap = await vinc.cap(); // Отримати значення кап

  // Спробуємо чеканити токени більше, ніж кап
  const mintAmount = cap + (ethers.parseEther("1"));

  // Очікуємо, що транзакція буде reverted з відповідним повідомленням
  await expect(vinc.connect(owner).mint(owner.address, mintAmount))
    .to.be.revertedWith("Cap exceeded");
});


});






