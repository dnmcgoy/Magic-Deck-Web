class Identifier
  include MongoMapper::EmbeddedDocument

  key :display, String
  key :email, String
  key :ident, String
  key :provider, String

end
