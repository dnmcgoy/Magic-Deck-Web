Tdb::Application.routes.draw do

  resources :cards

  resources :decks, :member => { :sample => :get, :count => :get, :rename => :post } do
    resources :runs
  end

  #with_options(:controller => 'decks') do |decks|
  #  decks.connect 'decks/:id/mana_curve_chart', :action => 'mana_curve_chart'
  #end

  #map.login "login", :controller => :rpx, :action => :index
  #map.logout "logout", :controller => :rpx, :action => :logout

  match "login" => "rpx#index", :as => :login
  match "logout" => "rpx#logout", :as => :logout

  #map.connect "tools", :controller => :landing, :action => :tools
  #map.connect "about", :controller => :landing, :action => :about

  root :to => 'landing#index'

end
