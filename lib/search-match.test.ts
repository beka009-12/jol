import assert from "node:assert/strict";
import { test } from "node:test";
import { matchesQuery } from "./search-match.ts";

test("finds inflected Russian words", () => {
  assert.equal(matchesQuery("Лыжи в Караколе", ["Выходные на лыжах в Караколе"]), true);
  assert.equal(matchesQuery("юрты", ["Юрточный лагерь «Жайлоо»"]), true);
  assert.equal(matchesQuery("Оше", ["Два дня в старом Оше"]), true);
});

test("splits hyphenated names", () => {
  assert.equal(matchesQuery("Иссык-Куле", ["Отель", "Иссык-Куль"]), true);
  assert.equal(matchesQuery("Song-Kol", ["Song-Kol", "Naryn"]), true);
});

test("every word must match", () => {
  assert.equal(matchesQuery("лыжи Ош", ["Лыжи в Караколе"]), false);
});

test("only matches the start of a word", () => {
  assert.equal(matchesQuery("ош", ["Хорошая столовая"]), false);
});

test("an empty or stop-word query matches everything", () => {
  assert.equal(matchesQuery("", ["Что угодно"]), true);
  assert.equal(matchesQuery("где в", ["Что угодно"]), true);
});

test("looks across all fields", () => {
  assert.equal(matchesQuery("плов Ош", ["Плов на базаре", "Ош"]), true);
});
