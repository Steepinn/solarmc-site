# Виноградник

Своё **вино и сидр** — мод **[Let's Do] Vinery**. Это **не** [Brewery](/docs/guides/gaid-po-napitkam) (там котёл, зельеварка и бочки для водки/пива).

## Схема целиком

```
лоза → ягоды → кадка (сок) → бродильная бочка → винная бутылка
яблоки → яблочный пресс → сок → (та же бочка, другие рецепты)
```

---

## 1. Виноград

1. Скрафти **стебель виноградной лозы** (см. крафт ниже) и поставь блок.
2. Посади на стебель **виноград** — семена/саженцы из деревень, сундуков или дикой лозы.
3. Дождись созревания и **собери ягоды** (красный / белый / джунглевый и т.д. — тип первой ягоды важен дальше).

---

## 2. Кадка для винограда (Grapevine Pot)

Здесь из ягод делают **сок в бутылках**, без котла.

1. Поставь **кадку**.
2. **ПКМ по кадке с виноградом в руке**, пока внутри не будет **6 ягод**.
   - **Первая ягода** задаёт тип сока (красный сок — из красного винограда и т.д.).
3. **Запрыгни в кадку** и топчись — пока ягоды не превратятся в мезгу (видно по состоянию блока).
4. **ПКМ пустой винной бутылкой** — забираешь сок.
   - Из **6 ягод** выходит **2 бутылки сока**.

**Винные бутылки** (не обычные стеклянные!) — отдельный крафт в верстаке (см. ниже). Пустые бутылки после розлива сока возвращаются и снова используются.

---

## 3. Бродильная бочка (Fermentation Barrel)

Это окно **«Бродильная бочка»** на скрине — главный этап вина.

### Крафт

Бочка Minecraft + 2 палки → **бочка брожения** (см. блок крафта ниже).

### Как пользоваться (по слотам в GUI)

| Место в окне | Зачем |
|--------------|--------|
| **Слева сверху — слот сока** | Сюда кладёшь **бутылки с соком** из кадки. Одна бутылка = **25 единиц** жидкости в бочке (до **4 бутылок** = полный бак). |
| **Полоска прогресса по центру** | Розовая/фиолетовая полоска — идёт **брожение** (~**5 минут** на одну порцию вина). Пустая = рецепт не сошёлся или не хватает сока. |
| **Три слота ингредиентов** | Ягоды, мед, glowstone, паутина и т.д. — **зависит от рецепта вина**. Смотри подсказку в игре (JEI на Solar нет — ориентируйся на вики мода или пробуй по гайдам ниже). |
| **Слот винной бутылки** | Часто нужна **пустая винная бутылка** в слоте — её «съедает» рецепт, готовое вино появится в выходе. |
| **Справа — выход** | Готовое **вино в бутылке** (например красное вино с этикеткой). |

### Важные правила

- В бочке **только один тип сока** за раз. Смешать красный и белый нельзя.
- Сначала **налей сок** (бутылки в левый слот), потом **ингредиенты + бутылка**, иначе рецепт не стартует.
- Наведи курсор на **индикатор жидкости** — увидишь тип сока и сколько % заполнено.
- **Shift + ПКМ** по бочке **сливает сок** и сбрасывает тип — если ошибся с сортом.
- Одна партия ≈ **5 минут** реального времени.

### Пример: простое красное вино (Noir и похожие)

Типичный рецепт семейства «красное вино»:

- В бочке **≥ 12 единиц красного виноградного сока** (хватит **1 бутылки** сока = 25 ед.).
- В ингредиенты — например **сладкая ягода** (sweet berries) + **винная бутылка** в слот бутылки (точный набор смотри в подсказке рецепта для твоего сорта).
- Ждёшь полоску прогресса → забираешь бутылку из **выхода**.

Другие вина меняют **тип сока** и **добавки** (мёд, glowstone, spider eye, iron ingot…). Имеет смысл поставить **несколько бочек** под разные сока — слить сок обратно неудобно.

---

## 4. Яблочный пресс и сидр

1. Скрафти **яблочный пресс** (люк + бочка + палки).
2. Кладёшь **яблоки**, получаешь **яблочный сок** в бутылках (логика как у винограда, но другой блок).
3. Сок **той же бродильной бочкой** → **сидр** и другие яблочные напитки (свои рецепты по типу сока).

---

## 5. Чем Vinery отличается от Brewery

| | **Vinery** | **Brewery** |
|---|------------|-------------|
| Блоки | кадка, пресс, **бродильная бочка** | **котёл**, зельеварка, бочка выдержки |
| Напитки | вино, сидр, медовуха из соков | пиво, водка, виски, ром… |
| Время | ~5 мин в бочке + сбор урожая | минуты варки + годы в бочке |

Крепкий алкоголь и пиво по котлу — [гайд по напиткам (Brewery)](/docs/guides/gaid-po-napitkam) и [рецепты](/docs/guides/gaid-po-napitkam/recepty-napitkov).

---

## Крафт

<div class="wiki-recipe">

<div class="wiki-recipe__head">

**Стебель лозы** ×4
<span class="wiki-recipe__tag">верстак</span>

</div>

<div class="wiki-craft">
<div class="wiki-craft__grid">
<span class="is-empty"></span><span>бревно</span><span class="is-empty"></span>
<span class="is-empty"></span><span>бревно</span><span class="is-empty"></span>
<span class="is-empty"></span><span class="is-empty"></span><span class="is-empty"></span>
</div>
<span class="wiki-craft__arrow">→</span>
<span class="wiki-craft__out">стебель ×4</span>
</div>

</div>

<div class="wiki-recipe">

<div class="wiki-recipe__head">

**Кадка для винограда**
<span class="wiki-recipe__tag">верстак</span>

</div>

<div class="wiki-craft">
<div class="wiki-craft__grid">
<span>плита</span><span class="is-empty"></span><span>плита</span>
<span>доска</span><span>доска</span><span>доска</span>
<span class="is-empty"></span><span class="is-empty"></span><span class="is-empty"></span>
</div>
<span class="wiki-craft__arrow">→</span>
<span class="wiki-craft__out">кадка</span>
</div>

<p class="wiki-recipe__note">Плита — деревянная. Доска — любой planks.</p>

</div>

<div class="wiki-recipe">

<div class="wiki-recipe__head">

**Бочка брожения**
<span class="wiki-recipe__tag">верстак</span>

</div>

<div class="wiki-craft">
<div class="wiki-craft__grid">
<span class="is-empty"></span><span>бочка</span><span class="is-empty"></span>
<span>палка</span><span class="is-empty"></span><span>палка</span>
<span class="is-empty"></span><span class="is-empty"></span><span class="is-empty"></span>
</div>
<span class="wiki-craft__arrow">→</span>
<span class="wiki-craft__out">брожение</span>
</div>

</div>

<div class="wiki-recipe">

<div class="wiki-recipe__head">

**Винная бутылка** ×4
<span class="wiki-recipe__tag">верстак</span>

</div>

<div class="wiki-craft">
<div class="wiki-craft__grid">
<span class="is-empty"></span><span>стекл.бут</span><span class="is-empty"></span>
<span class="is-empty"></span><span>стекл.бут</span><span class="is-empty"></span>
<span class="is-empty"></span><span class="is-empty"></span><span class="is-empty"></span>
</div>
<span class="wiki-craft__arrow">→</span>
<span class="wiki-craft__out">бут. ×4</span>
</div>

</div>

<div class="wiki-recipe">

<div class="wiki-recipe__head">

**Яблочный пресс**
<span class="wiki-recipe__tag">верстак</span>

</div>

<div class="wiki-craft">
<div class="wiki-craft__grid">
<span class="is-empty"></span><span>люк</span><span class="is-empty"></span>
<span>палка</span><span>бочка</span><span>палка</span>
<span>палка</span><span class="is-empty"></span><span>палка</span>
</div>
<span class="wiki-craft__arrow">→</span>
<span class="wiki-craft__out">пресс</span>
</div>

<p class="wiki-recipe__note">Люк — железный trapdoor.</p>

</div>

## Зачем

Вино даёт **длительные баффы** и атмосферу базы. Для «мутить алко» в смысле **вина/сидра** — только цепочка выше; для **водки и пива** — [Brewery](/docs/guides/gaid-po-napitkam).
