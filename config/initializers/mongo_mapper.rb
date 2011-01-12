MongoMapper.config = YAML::load(File.read(Rails.root + "config/mongo_database.yml"))
MongoMapper.connect(::Rails.env, :logger => Rails.logger)
