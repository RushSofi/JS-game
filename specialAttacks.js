export const SPECIAL_ATTACKS = {
  Scorpion: {
    name: 'Смертельный удар',
    damage: 50,
    condition: (hp) => hp <= 20,
  },
  Subzero: {
    name: 'Ледяной взрыв',
    damage: 40,
    condition: (hp) => hp <= 30,
  },
  Reptile: {
    name: 'Ядовитый плевок',
    damage: 35,
    condition: (hp) => hp <= 25,
  },
  Jax: {
    name: 'Сокрушительный удар',
    damage: 45,
    condition: (hp) => hp <= 15,
  },
  Kitana: {
    name: 'Веер смерти',
    damage: 40,
    condition: (hp) => hp <= 20,
  },
  LiuKang: {
    name: 'Удар дракона',
    damage: 50,
    condition: (hp) => hp <= 10,
  },
  Raiden: {
    name: 'Молния возмездия',
    damage: 55,
    condition: (hp) => hp <= 15,
  },
  Sonya: {
    name: 'Энергетический взрыв',
    damage: 45,
    condition: (hp) => hp <= 25,
  },
  JohnnyCage: {
    name: 'Смертельный удар ногой',
    damage: 40,
    condition: (hp) => hp <= 20,
  },
  Mileena: {
    name: 'Кровавый укус',
    damage: 35,
    condition: (hp) => hp <= 30,
  },
  NoobSaibot: {
    name: 'Теневой клинок',
    damage: 50,
    condition: (hp) => hp <= 15,
  },
  ShangTsung: {
    name: 'Кража души',
    damage: 60,
    condition: (hp) => hp <= 10,
  },
  Baraka: {
    name: 'Клинки смерти',
    damage: 45,
    condition: (hp) => hp <= 20,
  },
  Kano: {
    name: 'Лазерный выстрел',
    damage: 40,
    condition: (hp) => hp <= 25,
  },
  Kabal: {
    name: 'Смертельный вихрь',
    damage: 50,
    condition: (hp) => hp <= 15,
  },
  Ermac: {
    name: 'Телекинез',
    damage: 45,
    condition: (hp) => hp <= 20,
  },
  Cyrax: {
    name: 'Сетевой захват',
    damage: 40,
    condition: (hp) => hp <= 25,
  },
  Sektor: {
    name: 'Ракетный удар',
    damage: 50,
    condition: (hp) => hp <= 15,
  },
  Sheeva: {
    name: 'Сокрушительный прыжок',
    damage: 55,
    condition: (hp) => hp <= 10,
  },
  Sindel: {
    name: 'Крик смерти',
    damage: 60,
    condition: (hp) => hp <= 10,
  },
  Smoke: {
    name: 'Дымовая завеса',
    damage: 40,
    condition: (hp) => hp <= 20,
  },
  Nightwolf: {
    name: 'Удар духов',
    damage: 45,
    condition: (hp) => hp <= 15,
  },
  KungLao: {
    name: 'Вращающийся удар',
    damage: 50,
    condition: (hp) => hp <= 10,
  },
  Rain: {
    name: 'Водяной смерч',
    damage: 45,
    condition: (hp) => hp <= 20,
  },
  Stryker: {
    name: 'Гренадный удар',
    damage: 40,
    condition: (hp) => hp <= 25,
  },
};

export function getSpecialAttack(characterName, hp) {
  const specialAttack = SPECIAL_ATTACKS[characterName];
  if (specialAttack?.condition(hp)) {
    return specialAttack;
  }
  return null;
}