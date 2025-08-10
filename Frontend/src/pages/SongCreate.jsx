
import React, { useState } from "react";
import axios from "../api/axiosInstance.js";

export default function CreateSongForm() {
  const [form, setForm] = useState({
    title: "",
    artist: "",
    mood: "happy",
    audioType: "file", // 'file' or 'url'
    audioFile: null,
    audioUrl: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "audioFile") {
      setForm({ ...form, audioFile: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("artist", form.artist);
    formData.append("mood", form.mood);

    if (form.audioType === "file" && form.audioFile) {
      formData.append("audio", form.audioFile); // `req.file` handle karega
    } else if (form.audioType === "url" && form.audioUrl) {
      formData.append("audioUrl", form.audioUrl); // `req.body.audioUrl`
    } else {
      alert("Please provide an audio file or audio URL.");
      return;
    }

    try {
      const res = await axios.post("/song",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Song created:", res.data);
      alert("Song uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed");
    }
  };

  return (
    <div className="min-h-screen bg-indigo-100 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg space-y-6"
      >
        <h2 className="text-2xl font-bold text-indigo-700 text-center">
          Upload a Song
        </h2>

        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-indigo-300 rounded-md"
        />

        <input
          type="text"
          name="artist"
          placeholder="Artist"
          value={form.artist}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-indigo-300 rounded-md"
        />

        <select
          name="mood"
          value={form.mood}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-indigo-300 rounded-md"
        >
          <option value="happy">Happy</option>
          <option value="sad">Sad</option>
          <option value="neutral">Neutral</option>
          <option value="surprised">Surprised</option>
          <option value="angry">Angry</option>
        </select>

        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Audio Input
          </label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="audioType"
                value="file"
                checked={form.audioType === "file"}
                onChange={handleChange}
              />
              File
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="audioType"
                value="url"
                checked={form.audioType === "url"}
                onChange={handleChange}
              />
              URL
            </label>
          </div>
        </div>

        {form.audioType === "file" ? (
          <input
            type="file"
            name="audioFile"
            accept="audio/*"
            onChange={handleChange}
            className="w-full px-4 py-2 border border-indigo-300 rounded-md"
          />
        ) : (
          <input
            type="url"
            name="audioUrl"
            placeholder="Paste audio URL"
            value={form.audioUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-indigo-300 rounded-md"
          />
        )}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
        >
          Submit Song
        </button>
      </form>
    </div>
  );
}
