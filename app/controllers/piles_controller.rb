class PilesController < ApplicationController

  #layout nil

  def counts
    pile_id = params[:id]
    deck = Deck.first("piles._id" => BSON::ObjectId(pile_id))
    pile = deck.piles.detect { |p| p.id == BSON::ObjectId(pile_id) }

    render :json => pile.counts.to_json    
  end

  def show
    pile_id = params[:id]
    deck = Deck.first("piles._id" => BSON::ObjectId(pile_id))
    @pile = deck.piles.detect { |p| p.id == BSON::ObjectId(pile_id) }
  end

  def create
    pile_name = params[:name].downcase
    deck = Deck.find(params[:deck_id])

    if deck.piles.any? { |pile| pile.name == pile_name }
      render :json => deck.piles.detect { |pile| pile.name == pile_name }.to_json
    else
      pile = deck.piles << Pile.new(:name => pile_name)
      deck.save
      render :json => pile.to_json
    end
  end

  def destroy
    pile_id = params[:id]
    deck = Deck.find(params[:deck_id])
    pile = deck.piles.detect { |p| p.id == BSON::ObjectId(pile_id) }

    pile.destroy

    head :ok
  end
end
