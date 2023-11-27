const express = require("express");
const router = express.Router();
const fetchuser = require("../middlewere/fetchuser.js");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

// Route: 1 Here I will fetch all the notes of the user using user's id using: GET:api/notes/fetchnotes. Login required
router.get("/fetchnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.log(error);
    res.status(400).send("Internal Server Error!");
  }
});

// Route: 2 Adding a Note using POST: api/notes/addnote. Login required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Please enter a valid title").exists(),
    body("description", "Please enter a valid description").exists(),
    body("tag", "Please enter a valid tag"),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Validation errors
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, tag } = req.body;
      note = await Notes.create({
        title: title,
        description: description,
        tag: tag || "General", // General tag will be used if tag is not given by the user
        user: req.user.id,
      });

      res.status(200).json(note);
    } catch (error) {
      console.log(error);
      res.send("Internal Server Error!");
    }
  }
);

// Route 3: Updating an Note using PUT: api/notes/updatenote. Login required
router.put("/updatenote/:noteId", fetchuser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    // Making empty newNote object for updating the data
    let newNote = {};
    // If title or description or tag is not given by user there will be no problem because of if condition
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    let noteId = await Notes.findById(req.params.noteId);
    // If noteId is not available in my database then it will be sent to user
    if (!noteId) {
      return res.status(400).send("Note is not available");
    }
    // If another person is trying to update third person notes
    if (noteId.user.toString() !== req.user.id) {
      return res.status(400).send("Unauthorized access is not allowed!");
    }
    // Here I am updating the note with newNote
    let note = await Notes.findByIdAndUpdate(req.params.noteId, {
      $set: newNote,
    });

    res.status(200).json({ note });
  } catch (error) {
    console.log(error);
    res.status(400).send("Unexpected error occured!");
  }
});

// Route: 4 Deleting an Note using DELETE: api/notes/deletenote. Login required
router.delete("/deletenote/:noteId", fetchuser, async (req, res) => {
  try {
    const noteId = await Notes.findById(req.params.noteId);
    // If noteId is not available in my database then this message will be sent to user
    if (!noteId) {
      return res.status(404).send("Note is not available");
    }
    // If another person is trying to update third person notes
    if (noteId.user.toString() !== req.user.id) {
      return res.status(404).send("Unauthorized access is not allowed!");
    }
    // Here I am Deleting the note
    const deletedNote = await Notes.findByIdAndDelete(req.params.noteId);
    if (!deletedNote) {
      return res.status(404).send("Failed to delete the note");
    }
    // I am check if deletedNote is successfully completed then it will run
    else if (deletedNote) {
      return res
        .status(200)
        .send({ Status: "DELETED SUCCESSFULLY!", Note: deletedNote });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Unexpected error occured!");
  }
});

module.exports = router;
