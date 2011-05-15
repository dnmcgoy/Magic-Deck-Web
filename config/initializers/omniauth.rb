require 'openid/store/filesystem'

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :facebook, '159791907416288', 'bbf4dd45a43071552402049cadcfc4db'
  provider :twitter, 'MwnVURZ9zbZDuFYhPiINNw', 'ihO59H9LA1ceT2nLDC5XSnwwLFfwh9VboAGR3V8F2M'
  provider :openid, nil, :name => 'google', :identifier => 'https://www.google.com/accounts/o8/id'
end
