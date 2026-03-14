const Resource = require('../models/Resource');
const curatedResources = require('../data/curatedResources');

const seedResourcesIfEmpty = async () => {
  const existingCount = await Resource.countDocuments();

  if (existingCount > 0) {
    return;
  }

  await Resource.insertMany(curatedResources);
  console.log('Default curated resources seeded');
};

module.exports = seedResourcesIfEmpty;
