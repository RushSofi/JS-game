export class ComboSystem {
  constructor() {
    this.comboCount = 0;
    this.comboMultiplier = 1;
  }

  increaseCombo() {
    this.comboCount += 1;
    if (this.comboCount >= 3) {
      this.comboMultiplier = 2; // Увеличиваем урон в 2 раза
    }
  }

  resetCombo() {
    this.comboCount = 0;
    this.comboMultiplier = 1;
  }

  getDamage(damage) {
    return damage * this.comboMultiplier;
  }
}