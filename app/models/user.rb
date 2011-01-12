class User
  include MongoMapper::Document

  key :email, String
  key :nick, String
  key :photo_url, String

  many :decks
  many :identifiers

end
