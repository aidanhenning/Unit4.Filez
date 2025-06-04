import db from "#db/client";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  // TODO
  await db.query("DELETE FROM files");
  await db.query("DELETE FROM folders");

  const folders = [
    { name: "Documents" },
    { name: "Pictures" },
    { name: "Music" },
  ];

  for (const folder of folders) {
    const {
      rows: [insertedFolder],
    } = await db.query("INSERT INTO folders (name) VALUES ($1) RETURNING id", [
      folder.name,
    ]);

    const folderId = insertedFolder.id;

    for (let i = 1; i <= 5; i++) {
      await db.query(
        "INSERT INTO files (name, size, folder_id) VALUES ($1, $2, $3)",
        [`file${i}.txt`, Math.floor(Math.random() * 1000), folderId]
      );
    }
  }
}
