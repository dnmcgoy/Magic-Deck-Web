class EditProps
  include MongoMapper::EmbeddedDocument

  key :color, Integer
  key :order, Integer
end
