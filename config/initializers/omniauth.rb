require 'openid/store/filesystem'

Rails.application.config.middleware.use OmniAuth::Builder do
  if Rails.env == "development"
    provider :facebook, '159791907416288', 'bbf4dd45a43071552402049cadcfc4db'
  else
    provider :facebook, '102823226459404', '4a035f8bd7ec725b030ff9588b87bf28'
  end
  provider :twitter, 'MwnVURZ9zbZDuFYhPiINNw', 'ihO59H9LA1ceT2nLDC5XSnwwLFfwh9VboAGR3V8F2M'
  provider :openid, nil, :name => 'google', :identifier => 'https://www.google.com/accounts/o8/id'
end
