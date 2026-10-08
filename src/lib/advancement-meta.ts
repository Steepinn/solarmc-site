/** Русские названия ванильных достижений + иконки-предметы */
export type AdvancementMeta = {
  title: string;
  description?: string;
  /** item texture id without namespace, e.g. diamond */
  icon?: string;
  category: string;
};

const VANILLA: Record<string, AdvancementMeta> = {
  "minecraft:story/root": {
    title: "Minecraft",
    description: "Основа истории",
    icon: "grass_block",
    category: "История",
  },
  "minecraft:story/mine_stone": {
    title: "Каменный век",
    description: "Добыть камень киркой",
    icon: "wooden_pickaxe",
    category: "История",
  },
  "minecraft:story/upgrade_tools": {
    title: "Прокачка",
    description: "Сделать каменную кирку",
    icon: "stone_pickaxe",
    category: "История",
  },
  "minecraft:story/smelt_iron": {
    title: "Железный век",
    description: "Выплавить железный слиток",
    icon: "iron_ingot",
    category: "История",
  },
  "minecraft:story/obtain_armor": {
    title: "Броня!",
    description: "Надеть железную броню",
    icon: "iron_chestplate",
    category: "История",
  },
  "minecraft:story/lava_bucket": {
    title: "Горячее дело",
    description: "Ведро лавы",
    icon: "lava_bucket",
    category: "История",
  },
  "minecraft:story/iron_tools": {
    title: "Железные инструменты",
    description: "Железная кирка",
    icon: "iron_pickaxe",
    category: "История",
  },
  "minecraft:story/deflect_arrow": {
    title: "Не сегодня",
    description: "Отразить стрелу щитом",
    icon: "shield",
    category: "История",
  },
  "minecraft:story/form_obsidian": {
    title: "Обсидиан",
    description: "Добыть обсидиан",
    icon: "obsidian",
    category: "История",
  },
  "minecraft:story/mine_diamond": {
    title: "Алмазы!",
    description: "Добыть алмазы",
    icon: "diamond",
    category: "История",
  },
  "minecraft:story/enter_the_nether": {
    title: "В Нижний мир",
    description: "Построить портал",
    icon: "flint_and_steel",
    category: "История",
  },
  "minecraft:story/shiny_gear": {
    title: "Сияй ярче",
    description: "Алмазная броня",
    icon: "diamond_chestplate",
    category: "История",
  },
  "minecraft:story/enchant_item": {
    title: "Зачаровыватель",
    description: "Зачаровать предмет",
    icon: "enchanted_book",
    category: "История",
  },
  "minecraft:story/cure_zombie_villager": {
    title: "Зомбодоктор",
    description: "Вылечить зомби-крестьянина",
    icon: "golden_apple",
    category: "История",
  },
  "minecraft:story/follow_ender_eye": {
    title: "За глазом",
    description: "Найти крепость",
    icon: "ender_eye",
    category: "История",
  },
  "minecraft:story/enter_the_end": {
    title: "Конец?",
    description: "Войти в Энд",
    icon: "end_stone",
    category: "История",
  },
  "minecraft:nether/root": {
    title: "Нижний мир",
    icon: "netherrack",
    category: "Нижний мир",
  },
  "minecraft:nether/return_to_sender": {
    title: "Вернуть отправителю",
    icon: "fire_charge",
    category: "Нижний мир",
  },
  "minecraft:nether/find_bastion": {
    title: "Бастион",
    icon: "polished_blackstone_bricks",
    category: "Нижний мир",
  },
  "minecraft:nether/obtain_ancient_debris": {
    title: "Древние обломки",
    icon: "ancient_debris",
    category: "Нижний мир",
  },
  "minecraft:nether/netherite_armor": {
    title: "Незеритовая броня",
    icon: "netherite_chestplate",
    category: "Нижний мир",
  },
  "minecraft:nether/summon_wither": {
    title: "Иссушитель",
    icon: "wither_skeleton_skull",
    category: "Нижний мир",
  },
  "minecraft:end/root": {
    title: "Энд",
    icon: "end_stone",
    category: "Энд",
  },
  "minecraft:end/kill_dragon": {
    title: "Освободитель",
    description: "Убить дракона",
    icon: "dragon_head",
    category: "Энд",
  },
  "minecraft:end/elytra": {
    title: "Элитры",
    icon: "elytra",
    category: "Энд",
  },
  "minecraft:adventure/root": {
    title: "Приключения",
    icon: "oak_leaves",
    category: "Приключения",
  },
  "minecraft:adventure/kill_a_mob": {
    title: "Монстробой",
    icon: "iron_sword",
    category: "Приключения",
  },
  "minecraft:adventure/shoot_arrow": {
    title: "Снайпер",
    icon: "bow",
    category: "Приключения",
  },
  "minecraft:adventure/sleep_in_bed": {
    title: "Сладкий сон",
    icon: "red_bed",
    category: "Приключения",
  },
  "minecraft:adventure/adventuring_time": {
    title: "Время странствий",
    icon: "leather_boots",
    category: "Приключения",
  },
  "minecraft:husbandry/root": {
    title: "Фермерство",
    icon: "hay_block",
    category: "Фермерство",
  },
  "minecraft:husbandry/breed_an_animal": {
    title: "Семейство",
    icon: "wheat",
    category: "Фермерство",
  },
  "minecraft:husbandry/plant_seed": {
    title: "Посев",
    icon: "wheat_seeds",
    category: "Фермерство",
  },
  "minecraft:husbandry/tame_an_animal": {
    title: "Лучший друг",
    icon: "bone",
    category: "Фермерство",
  },
  "minecraft:nether/obtain_blaze_rod": {
    title: "В огонь",
    description: "Добыть огненный стержень",
    icon: "blaze_rod",
    category: "Нижний мир",
  },
  "solar:root": {
    title: "Solar",
    description: "Добро пожаловать на Solar",
    icon: "sunflower",
    category: "Solar",
  },
  "solar:world/mountain_king": {
    title: "Горный король",
    icon: "emerald",
    category: "Solar",
  },
  "solar:world/skill_tree_hint": {
    title: "Дерево навыков",
    description: "Открой дерево навыков",
    icon: "experience_bottle",
    category: "Solar",
  },
  "solar:combat/first_blood": {
    title: "Первая кровь",
    description: "Первое убийство в бою",
    icon: "iron_sword",
    category: "Solar",
  },
  "solar:world/biome_snow": {
    title: "Снежный биом",
    icon: "snowball",
    category: "Solar",
  },
  "farmersdelight:main/root": {
    title: "Farmers Delight",
    icon: "wheat",
    category: "Моды",
  },
  "farmersdelight:main/place_feast": {
    title: "Пир",
    description: "Поставить праздничный стол",
    icon: "cooked_beef",
    category: "Моды",
  },
  "dungeons_arise:wda_root": {
    title: "Dungeons Arise",
    icon: "iron_sword",
    category: "Моды",
  },
  "betterdungeons:root": {
    title: "YUNG",
    icon: "mossy_stone_bricks",
    category: "Моды",
  },
  "artifacts:amateur_archaeologist": {
    title: "Любитель-археолог",
    icon: "brush",
    category: "Моды",
  },
};

const CATEGORY_BY_NS: Record<string, string> = {
  minecraft: "Minecraft",
  solar: "Solar",
  farmersdelight: "Моды",
  dungeons_arise: "Моды",
  betterdungeons: "Моды",
  rpg_series: "Моды",
  incendium: "Моды",
  bomd: "Моды",
  levelz: "Моды",
  artifacts: "Моды",
  tide: "Моды",
  origins: "Моды",
};

export function isRecipeAdvancement(id: string) {
  return id.includes(":recipes/") || id.includes("/recipes/");
}

export function isTechnicalAdvancement(id: string) {
  return (
    id.includes("/technical/") ||
    id.endsWith("/recipes") ||
    isRecipeAdvancement(id)
  );
}

export function advancementMeta(id: string): AdvancementMeta {
  const known = VANILLA[id];
  if (known) return known;

  const [ns, ...rest] = id.split(":");
  const pathPart = rest.join(":") || id;
  const leaf = pathPart.split("/").pop() ?? pathPart;
  const title = leaf
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  let category = CATEGORY_BY_NS[ns ?? ""] ?? ns ?? "Другое";
  if (pathPart.startsWith("story/")) category = "История";
  else if (pathPart.startsWith("nether/")) category = "Нижний мир";
  else if (pathPart.startsWith("end/")) category = "Энд";
  else if (pathPart.startsWith("adventure/")) category = "Приключения";
  else if (pathPart.startsWith("husbandry/")) category = "Фермерство";

  return { title, category, icon: "experience_bottle" };
}

/** Иконка предмета/блока → реальный путь текстуры в assets Minecraft */
const TEXTURE_ALIAS: Record<string, { folder: "item" | "block"; file: string }> = {
  grass_block: { folder: "block", file: "grass_block_side" },
  sunflower: { folder: "block", file: "sunflower_front" },
  hay_block: { folder: "block", file: "hay_block_side" },
  ancient_debris: { folder: "block", file: "ancient_debris_side" },
  maple_leaves: { folder: "block", file: "oak_leaves" },
  oak_leaves: { folder: "block", file: "oak_leaves" },
  end_stone: { folder: "block", file: "end_stone" },
  netherrack: { folder: "block", file: "netherrack" },
  obsidian: { folder: "block", file: "obsidian" },
  polished_blackstone_bricks: { folder: "block", file: "polished_blackstone_bricks" },
  mossy_stone_bricks: { folder: "block", file: "mossy_stone_bricks" },
  powder_snow_bucket: { folder: "item", file: "powder_snow_bucket" },
};

const BLOCK_ITEMS = new Set([
  "grass_block",
  "end_stone",
  "netherrack",
  "obsidian",
  "ancient_debris",
  "hay_block",
  "polished_blackstone_bricks",
  "sunflower",
  "oak_leaves",
  "mossy_stone_bricks",
]);

export function advancementIconUrl(icon?: string) {
  const item = icon || "experience_bottle";
  const alias = TEXTURE_ALIAS[item];
  if (alias) {
    return `https://assets.mcasset.cloud/1.21.1/assets/minecraft/textures/${alias.folder}/${alias.file}.png`;
  }
  const folder = BLOCK_ITEMS.has(item) ? "block" : "item";
  return `https://assets.mcasset.cloud/1.21.1/assets/minecraft/textures/${folder}/${item}.png`;
}

/** Fallback, если CDN/текстура недоступна */
export const ADVANCEMENT_ICON_FALLBACK =
  "https://assets.mcasset.cloud/1.21.1/assets/minecraft/textures/item/experience_bottle.png";

