class Printing
  include MongoMapper::EmbeddedDocument

  key :mtg_id, String
  key :rarity, String
  key :set_number, String
  key :artist, String
  key :printed_text, String
  key :flavor_text, String

  key :set_id, BSON::ObjectId


end
