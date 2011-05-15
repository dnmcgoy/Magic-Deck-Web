class Identifier
  include MongoMapper::EmbeddedDocument

  key :display, String
  key :email, String
  key :ident, String
  key :provider, String

  def provider_name
    if provider == 'facebook'
      "Facebook"
    else
      provider.titleize
    end
  end

end
