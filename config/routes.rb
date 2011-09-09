Tdb::Application.routes.draw do

  resources :cards do
    collection do
      get :autocomplete
      post :simple_search
    end
  end

  resources :decks do
    collection do
      post :import
      post :addFromDeckList
    end

    resources :runs

    resources :piles do
      member do
        get :counts
      end
    end

    member do
      get :sample
      get :count
      get :export
      post :rename
      post :move_run
    end
    match "mana_curve_chart" => "decks#mana_curve_chart"
  end

  resources :identifiers

  #with_options(:controller => 'decks') do |decks|
  #  decks.connect 'decks/:id/mana_curve_chart', :action => 'mana_curve_chart'
  #end

  #map.login "login", :controller => :rpx, :action => :index
  #map.logout "logout", :controller => :rpx, :action => :logout

  match "/auth/:provider/callback" => "identifiers#create", :as => :login
  match "logout" => "identifiers#destroy", :as => :logout

  match "tools" => "landing#tools"
  match "about" => "landing#about"

  match "search" => "cards#search"

  #map.connect "tools", :controller => :landing, :action => :tools
  #map.connect "about", :controller => :landing, :action => :about

  root :to => 'identifiers#index'

end
