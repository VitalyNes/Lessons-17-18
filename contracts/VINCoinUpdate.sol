// SPDX-License-Identifier: MIT
//OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/ERC20.sol)
pragma solidity 0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {IERC20Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract VINCoin is Ownable, ERC20Capped, ERC20Burnable {
    uint8 constant DECIMALS = 14;
function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Capped) {
        super._update(from, to, value);
    }

    // Конструктор з ініціалізацією імені, символу та максимальної кількості токенів.
    constructor() ERC20("VINCoin", "VIN") ERC20Capped(920000000 * 10 ** DECIMALS) Ownable(msg.sender) {
    } 

    // Функція для створення (чеканення) токенів. Доступна тільки власнику контракту.
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= cap(), "Cap exceeded"); // Перевірка, щоб загальна кількість не перевищила ліміт
        _mint(to, amount); // Власне чеканення токенів
    }
    
    // Перевизначення функції для вказівки кількості десяткових знаків
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
}

contract ICO {
    uint256 rate = 10; // Курс обміну: 1 ETH = 10 VIN

    address public token;

    // Конструктор для ініціалізації адреси токену
    constructor(address _token) {
        token = _token;
    }

    // Функція для обміну ETH на токени
    function swap() external payable {
        uint256 amount = msg.value * rate; // Обчислення кількості токенів
        require(VINCoin(token).balanceOf(address(this)) >= amount, "Not enough tokens in ICO"); // Перевірка наявності достатньої кількості токенів
        VINCoin(token).transfer(msg.sender, amount); // Передача токенів користувачеві
    }
}
