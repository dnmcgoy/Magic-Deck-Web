class MagicSet
  include MongoMapper::Document

  key :name, String
  key :short_name, String
  key :release_date, Date

end
