const university = require('./UniversitySeeder')
const faculty = require('./FacultySeeder')
const featureIcons = require('./FeatureIconSeeder')
const city = require('./CitySeeder')

university.run()
faculty.run()
featureIcons.run()
city.run()

console.log('Seeded Successfully')