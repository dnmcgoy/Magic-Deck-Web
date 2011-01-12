class RunsController < ApplicationController
  layout nil

  def index
    @runs = Deck.find(params[:deck_id]).runs

    respond_to do |format|
      format.xml  { render :xml => @runs }
    end
  end

  def create
    card_name = params[:card_name]
    deck = Deck.find(params[:deck_id])
    count = params[:count].blank? ? 1 : params[:count].to_i

    card = Card.find_or_create_by_name(card_name)
    card = card.sync_with_gatherer

    @run = deck.maindeck.runs.detect { |r| r.card_id == card.id }
    if @run.nil?
      @run = Run.new(:card => card, :count => 0)
      deck.maindeck.runs << @run
    end

    @run.count += count
    deck.save

    respond_to do |format|
      format.json  {
        # Huh, this seems like a dirty hack to me...
        card_attrs = Card.new.attributes.keys.reject{ |k| k.chars.first == '_' }
        render :json => @run.to_json(:methods =>card_attrs)
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
    @run = deck.maindeck.runs.detect { |r| r.id.to_s == params[:id] }
    puts "about to delete run #{@run.id}"
    deck.maindeck.runs.delete(@run)
    deck.save
    head :ok
  end
end
