class CardsController < ApplicationController

  def index
    @cards = Card.all
    
    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @cards }
      format.json  { render :json => @cards.to_json }
    end
  end

  def autocomplete
    term = params[:term]
    cardListing = []
    for card in Card.autocomplete(term)
      cardListing << {:value => card.name, :label => card.name, :mtgid => card.mtg_id }
    end
    render :json => cardListing.to_json()
  end

  def simple_search
    puts "We are searching: "
    puts params[:name]

    listings = Card.simple_search(params).map do |card|
      { :name => card.name,
        :cmc => card.cmc,
        :cc => card.cc,
        :mtg_id => card.mtg_id,
        :category => card.category,
        :cardtype => card.cardtype,
        :rules => card.oracle_text
      }
    end
    render :json => listings.to_json()
  end

  def show
    @card = Card.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @card }
    end
  end

  def new
    @card = Card.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @card }
    end
  end

  #def edit
  #  @card = Card.find(params[:id])
  #end

  def create
    @card = Card.new(params[:card])

    respond_to do |format|
      if @card.save
        flash[:notice] = 'Card was successfully created.'
        format.html { redirect_to(@card) }
        format.xml  { render :xml => @card, :status => :created, :location => @card }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @card.errors, :status => :unprocessable_entity }
      end
    end
  end

  def update
    @card = Card.find(params[:id])

    respond_to do |format|
      if @card.update_attributes(params[:card])
        flash[:notice] = 'Card was successfully updated.'
        format.html { redirect_to(@card) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @card.errors, :status => :unprocessable_entity }
      end
    end
  end

  def destroy
    @card = Card.find(params[:id])
    @card.destroy

    respond_to do |format|
      format.html { redirect_to(cards_url) }
      format.xml  { head :ok }
    end
  end
end
