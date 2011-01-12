class Suggestion
  include MongoMapper::Document

  key :comment, String

  belongs_to :user

end
