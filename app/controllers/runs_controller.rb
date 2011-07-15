class RunsController < ApplicationController
  layout nil

  def index
    @runs = Deck.find(params[:deck_id]).runs

    respond_to do |format|
      format.xml  { render :xml => @runs }
    end
  end

  # this needs to make sure the deck belongs to the user
  def create
    card_name = params[:card_name].downcase
    deck = Deck.find(params[:deck_id])

    puts deck.id

    count = params[:count].blank? ? 1 : params[:count].to_i

    # use the maindeck if pile isn't given, or doesn't exist
    pile_id = params[:pile_id]
    pile = deck.piles.detect { |p| p.id == BSON::ObjectId(pile_id) }
    pile ||= deck.maindeck

    puts pile.id

    card = Card.first(:name => /^#{card_name}$/i)
    puts "CARD: #{card.inspect}"
    @run = pile.runs.detect { |r| r.card_id == card.id }
    if @run.nil?
      @run = Run.new(:card => card, :count => 0)
      pile.runs << @run
    end

    if(!@run.nil? && @run.count + count == 0)
      pile.runs.delete(@run)
      @run.count = 0
    elsif(@run.count + count > 0)
      @run.count += count
    end

    deck.save

    respond_to do |format|
      format.json  {
        extra_attrs = [:category, :name, :cc, :cmc, :mtg_id]
        render :json => @run.to_json(:methods => extra_attrs)
      }
    end
  end

  def show
    deck = Deck.find(params[:deck_id])
    @run = deck.maindeck.runs.detect { |r| r.id == params[:id] }
    respond_to do |format|
      format.xml  { render :xml => @run.to_xml( :include => :card ) }
      format.json  { render :json => @run.to_json( :include => :card ) }
    end
  end

  def destroy
    deck = Deck.find(params[:deck_id])

    # TODO this seems terrible...there has to be a better way to
    # have mongo do this for us
    deck.piles.each do |pile|
      @run = pile.runs.detect { |r| r.id.to_s == params[:id] }
      next if @run.nil?

      puts "about to delete run #{@run.id}"
      pile.runs.delete(@run)      
    end

    deck.save
    head :ok
  end
end
