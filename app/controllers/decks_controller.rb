require 'csv'

class DecksController < ApplicationController

  before_filter :require_login, :except => :show

  def mana_curve_chart
    @deck = @user.decks.find(params[:deck_id])
    render :json => {:src => @deck.mana_curve_chart, :alt => "mana curve chart"}.to_json
  end

  def index

    #FIXME getting list of friends doesn't belong here. FIX ASAP.
    if @token = @user['facebook_token'] 
      @graph = Koala::Facebook::GraphAPI.new(@token) 
      @friends = @graph.get_connections("me", "friends") 
    end

    @user_friends = []
    for friend in @friends
      magicDeckFriend = User.first({'identifiers.provider' => 'facebook', 'identifiers.ident' => friend['id']})
      @user_friends << magicDeckFriend if magicDeckFriend
    end

    @decks = @user.decks.all
    

    respond_to do |format|
      format.html { }
      format.xml  { render :xml => @decks }
    end
  end

  def show
    @deck = Deck.find(params[:id])
    @is_owner = @user && @deck.user_id == @user.id

    respond_to do |format|
      format.html # show.html.erb
      format.xml
      format.json { render :json => @deck.to_json }
    end
  end

  def sample
    @deck = Deck.find(params[:id])
  end

  def count
    @deck = Deck.find(params[:id])
    render :json => @deck.count.to_json
  end

  def import
    outputStuff = params[:dump][:file].read
    @deck = @user.decks.build()
    if params[:dump][:file].original_filename =~ /(.*)\.dec/
      @deck.name = $1
    else
      @deck.name = "New Deck"
    end
    @deck.init_piles
    for line in outputStuff
      if line =~ /^ *([0-9]+x?) (.*)/
        count = $1
        card_name = $2
        card = Card.first(:name => /^#{card_name}$/i)
        if (card)
          run = Run.new(:card => card, :count => count)
          @deck.maindeck << run
        end
      end
    end
    if @deck.save
      redirect_to edit_deck_path(@deck)
    end
  end

  def export
    @deck = Deck.find(params[:id])
    deckdata = ""
    for run in @deck.maindeck.runs
      deckdata += run.count.to_s + " " + run.name.to_s + "\n"
    end
    send_data deckdata, {:filename => @deck.name + ".dec"}
  end

  def new
    @deck = @user.decks.create(:name => "New Deck")
    redirect_to edit_deck_path(@deck)
  end

  def edit
    @deck = @user.decks.find(params[:id])
    names = [Pile::MAINDECK, Pile::SIDEBOARD] + @deck.piles.map(&:name)
    @pile_names = names.uniq
  end

  def create
    @deck = @user.decks.build(params[:deck])

    respond_to do |format|
      if @deck.save
        flash[:notice] = 'Deck was successfully created.'
        format.html { redirect_to edit_deck_path(@deck) }
        format.xml  { render :xml => @deck, :status => :created, :location => @deck }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @deck.errors, :status => :unprocessable_entity }
      end
    end
  end

  def rename
    @deck = @user.decks.find(params[:id])

    new_name = params[:name]
    @deck.name = new_name
    @deck.save

    render :json => @deck.to_json
  end

  def update
    @deck = @user.decks.find(params[:id])

    respond_to do |format|
      if @deck.update_attributes(params[:deck])
        flash[:notice] = 'Deck was successfully updated.'
        format.html { redirect_to(@deck) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @deck.errors, :status => :unprocessable_entity }
      end
    end
  end

  def destroy
    @deck = @user.decks.find(params[:id])
    @deck.destroy

    respond_to do |format|
      format.html { redirect_to(decks_url) }
      format.xml  { head :ok }
    end
  end

end
