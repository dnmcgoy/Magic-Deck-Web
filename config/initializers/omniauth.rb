require 'openid/store/filesystem'

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :facebook, '102823226459404', '4a035f8bd7ec725b030ff9588b87bf28'
  provider :twitter, 'MwnVURZ9zbZDuFYhPiINNw', 'ihO59H9LA1ceT2nLDC5XSnwwLFfwh9VboAGR3V8F2M'
  provider :openid, nil, :name => 'google', :identifier => 'https://www.google.com/accounts/o8/id'
end
