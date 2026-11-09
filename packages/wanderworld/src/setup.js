// What the AI's setup of a new world amounts to, in words, for the review before the land is built.
// The setup itself is keywords in the plain convention (main.js `aiLoreSetup`): this only reads them.
import { linksFromWords, setupFromWords } from "./relationships.js";

const after = (words, pattern) => words.map((word) => pattern.exec(word)?.[1]).find(Boolean) ?? "";

/**
 * A setup, summed up. `setup`: { loreKeys: { "cards/<id>" | "<lorebook>/<entry>": [keywords] }, loreNames:
 * { numbered place: name } }; `characters`: the cast as [{ id, name }]; `entries`: how many lorebook
 * entries were read. Returns { people: [{ name, body, home, work, owner, toPlayer, links: [words] }],
 * named: [[place, name]], lore: { placed, world, untied } }.
 */
export function summariseSetup(setup, { characters = [], persona = "", entries = 0 } = {}) {
  const keys = setup?.loreKeys ?? {};
  const person = (name, words) => {
    const { body, relation } = setupFromWords(words);
    return {
      name,
      body,
      home: after(words, /^lives in\s+(.+)$/iu),
      work: after(words, /^(?:works at|owner of)\s+(.+)$/iu),
      owner: words.some((word) => /^owner of\s/iu.test(word)),
      toPlayer: relation ? relation.role || relation.kind : "",
      links: words.filter((word) => linksFromWords([word]).length),
    };
  };
  const people = characters
    .filter((character) => keys[`cards/${character.id}`])
    .map((character) => person(character.name, keys[`cards/${character.id}`]));
  if (keys["cards/player"])
    people.unshift({ ...person(persona || "You", keys["cards/player"]), toPlayer: "", you: true });
  const lore = Object.entries(keys).filter(([key]) => !key.startsWith("cards/"));
  const world = lore.filter(([, words]) => words.some((word) => word.toLowerCase() === "world")).length;
  return {
    people,
    named: Object.entries(setup?.loreNames ?? {}),
    lore: { placed: lore.length - world, world, untied: Math.max(0, entries - lore.length) },
  };
}
