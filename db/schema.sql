-- TODO

DROP TABLE IF EXISTS files;
DROP TABLE IF EXISTS folders;

CREATE TABLE folders (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  size INT NOT NULL,
  folder_id INT NOT NULL,
  CONSTRAINT files_folder_id_fkey FOREIGN KEY (folder_id)
    REFERENCES folders(id)
    ON DELETE CASCADE,
  CONSTRAINT files_name_folder_id_key UNIQUE (name, folder_id)
);


