class Card
  include MongoMapper::Document

  key :name, String
  key :shortname, String
  key :release, Date

end
