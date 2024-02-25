const { response } = require("express");
const knex = require("../database/knex");

class NotesController {
  async create(req, res) {
    const { title, description, tags, rating } = req.body;
    const { user_id } = req.params;
    const [note_id] = await knex("notes").insert({
      title,
      description,
      rating,
      user_id,
    });

    const tagsInsert = tags.map((name) => {
      return {
        note_id,
        name,
        user_id,
      };
    });

    await knex("tags").insert(tagsInsert);

    res.json();
  }

  async show(req, res) {
    const { id } = req.params;

    const note = await knex("notes").where({ id }).first();
    const tags = await knex("tags").where({ note_id: id }).orderBy("name");

    return res.json({
      ...note,
      tags,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    await knex("notes").where({ id }).delete();

    return res.json();
  }

  async index(req, res) {
    const { title, user_id, tags, rating } = req.query;

    let notes;

    if (tags) {
      const filterTags = tags.split(",").map((tag) => tag.trim());

      notes = await knex("tags")
        .select(["notes.id", "notes.title", "notes.user_id"])
        .where("notes.user_id", user_id)
        .whereLike("notes.title", `%${title}%`)
        .whereIn("name", filterTags)
        .innerJoin("notes", "notes.id", "tags.note_id")
        .orderBy("notes.title");
    } else {
      notes = await knex("notes")
        .where({ user_id })
        .whereLike("title", `%${title}%`)
        .orderBy("title");
    }

    const userTags = await knex("tags").where({ user_id });
    const notesWithTags = notes.map((note) => {
      const noteTags = userTags.filter((tag) => tag.note_id === note.id);

      return {
        ...note,
        tags: noteTags,
      };
    });

    return res.json(notesWithTags);
  }
}

module.exports = NotesController;
