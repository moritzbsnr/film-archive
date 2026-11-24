-- Copyright (C) 2022 - present Juergen Zimmermann, Hochschule Karlsruhe
--
-- This program is free software: you can redistribute it and/or modify
-- it under the terms of the GNU General Public License as published by
-- the Free Software Foundation, either version 3 of the License, or
-- (at your option) any later version.
--
-- This program is distributed in the hope that it will be useful,
-- but WITHOUT ANY WARRANTY; without even the implied warranty of
-- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
-- GNU General Public License for more details.
--
-- You should have received a copy of the GNU General Public License
-- along with this program.  If not, see <https://www.gnu.org/licenses/>.

-- TEXT statt varchar(n):
-- "There is no performance difference among these three types, apart from a few extra CPU cycles
-- to check the length when storing into a length-constrained column"
-- ggf. CHECK(char_length(nachname) <= 255)

-- https://www.postgresql.org/docs/current/manage-ag-tablespaces.html
SET search_path TO film;
SET default_tablespace = filmspace;

-- https://www.postgresql.org/docs/current/sql-createtable.html
-- https://www.postgresql.org/docs/current/datatype.html
-- https://www.postgresql.org/docs/current/sql-createtype.html
-- https://www.postgresql.org/docs/current/datatype-enum.html
CREATE TABLE IF NOT EXISTS film (
    id                 INTEGER GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY,
    titel              TEXT NOT NULL,
    erscheinungsjahr   DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS schauspieler (
    id             INTEGER GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY,
    vorname        TEXT NOT NULL,
    nachname       TEXT NOT NULL,
    film_id        INTEGER NOT NULL REFERENCES film ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS drehbuch (
    id          INTEGER GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY,
    titel       TEXT NOT NULL,
    autor       TEXT NOT NULL,
    seitenzahl  INTEGER NOT NULL CHECK (seitenzahl > 0),
    film_id     INTEGER NOT NULL UNIQUE REFERENCES film ON DELETE CASCADE
);
