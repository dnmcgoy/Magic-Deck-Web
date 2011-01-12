class DecksController < ApplicationController

  before_filter :require_login, :except => :show

  def mana_curve_chart
    @deck = @user.decks.find(params[:id])
    render :json => {:src => @deck.mana_curve_chart, :alt => "mana curve chart"}.to_json
  end

  def index
    @decks = @user.decks.all

    respond_to do |format|
      format.html { render :layout => 'application' }
      format.xml  { render :xml => @decks }
    end
  end

  def show
    @deck = Deck.find(params[:id])
    @is_owner = @user && @deck.user_id == @user.id

    respond_to do |format|
      format.html # show.html.erb
      format.xml
    end
  end

  def sample
    @deck = Deck.find(params[:id])
  end

  def count
    @deck = Deck.find(params[:id])
    render :json => @deck.count.to_json
  end


  def new
    @deck = @user.decks.create(:name => "New Deck")
    redirect_to edit_deck_path(@deck)
  end

  def edit
    @deck = @user.decks.find(params[:id])
  end

  def create
    @deck = @user.decks.build(params[:deck])

    respond_to do |format|
      if @deck.save
        flash[:notice] = 'Deck was successfully created.'
        format.html { redirect_to(@deck) }
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
