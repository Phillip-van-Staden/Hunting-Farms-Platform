CREATE DATABASE hunting;
-- 1. Person
CREATE TABLE Person (
    pId SERIAL PRIMARY KEY,
    pNaam VARCHAR(100) NOT NULL,
    pVan VARCHAR(100) NOT NULL,
    pEmail VARCHAR(255) UNIQUE NOT NULL,
    pPassword TEXT NOT NULL,
    pCategory VARCHAR(50),
    pSubscribe BOOLEAN DEFAULT FALSE,
    pAdmin BOOLEAN DEFAULT FALSE,
    pBlocked BOOLEAN DEFAULT FALSE
);

-- 2. Review
CREATE TABLE Review (
    rId SERIAL PRIMARY KEY,
    rStar INT CHECK (rStar >= 1 AND rStar <= 5),
    rDescription TEXT,
    rDate DATE DEFAULT CURRENT_DATE,
    pId INT REFERENCES Person(pid) ON DELETE CASCADE,
    fId INT REFERENCES Farms(fId) ON DELETE CASCADE,
    rDeleted BOOLEAN DEFAULT FALSE,
    rDeletedMessage VARCHAR(100)
);

-- 3. Farms
CREATE TABLE Farms (
    fId SERIAL PRIMARY KEY,
    fName VARCHAR(200) NOT NULL,
    fProvince VARCHAR(200),
    fDescription TEXT,
    fFacilities VARCHAR(100)[],--array
    fCategory VARCHAR(100)[],--aray
    pID INT REFERENCES Person(pid) ON DELETE SET NULL,
    fDailyRate NUMERIC(10,2),
    fWebsite VARCHAR(100),
    fPhone VARCHAR(100),
    fEmail VARCHAR(100),
    fAdress VARCHAR(200),
    fGPS VARCHAR(100)
);

-- 4. Deer
CREATE TABLE Deer (
    dId SERIAL PRIMARY KEY,
    dTipe VARCHAR(100) NOT NULL
);

-- 5. FarmsDeer
CREATE TABLE FarmsDeer (
    fdId SERIAL PRIMARY KEY,
    fId INT REFERENCES Farms(fId) ON DELETE CASCADE,
    dId INT REFERENCES Deer(dId) ON DELETE CASCADE,
    fdMalePrice NUMERIC(10,2),
    fdFemalePrice NUMERIC(10,2)
);

-- 6. FarmsImage
CREATE TABLE FarmsImage (
    fImageId SERIAL PRIMARY KEY,
    fId INT REFERENCES Farms(fId) ON DELETE CASCADE,
    fImagePath VARCHAR(255) -- storing binary image data (can also use TEXT for URL)
);

-- 7. Blogs
CREATE TABLE Blogs (
    bId SERIAL PRIMARY KEY,
    bTitle VARCHAR(255) NOT NULL,
    bCategory VARCHAR(100),
    bDescription TEXT,
    bStory TEXT,
    pID INT REFERENCES Person(pId)  ON DELETE CASCADE,
    bDate DATE DEFAULT CURRENT_DATE,
    bImage VARCHAR(255),
    bTags VARCHAR(100)[],--array
    bStatus VARCHAR(100) DEFAULT 'Pending',
    bStatusMessage VARCHAR(100)
);
