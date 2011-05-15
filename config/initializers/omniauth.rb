require 'openid/store/filesystem'

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :facebook, '159791907416288', 'bbf4dd45a43071552402049cadcfc4db'
  provider :openid, nil, :name => 'google', :identifier => 'https://www.google.com/accounts/o8/id'
end
