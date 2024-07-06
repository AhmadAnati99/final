ALTER TABLE flights_project.flights
ADD CONSTRAINT fk_country_id
FOREIGN KEY (Country_Id)
REFERENCES Countries(Id);