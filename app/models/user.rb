class User
  include MongoMapper::Document

  key :email, String
  key :nick, String
  key :name, String
  key :photo_url, String

  many :decks
  many :identifiers

  def apply_omniauth(omniauth)
    self.nick = omniauth['user_info']['name'] if nick.blank?
    self.email = omniauth['user_info']['email'] if email.blank?
    identifiers.build(:provider => omniauth['provider'], 
                      :ident => omniauth['uid'])
  end

end
