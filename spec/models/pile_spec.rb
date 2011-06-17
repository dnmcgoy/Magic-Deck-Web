require 'spec_helper'

describe Pile do

  describe 'destroy' do
    before do
      @deck = Factory(:deck)
      @deck.piles << Factory.create(:pile)
      @deck.save!
      @pile = @deck.piles.first
    end

    it 'should raise exception when name is maindeck' do
      @pile.name = Pile::MAINDECK
      @deck.save!
      expect { @pile.destroy }.to raise_exception
    end

    it 'should work when name is not maindeck' do
      @pile.name = 'another pile'
      @deck.save!

      @deck.should have(2).piles
      @pile.destroy
      @deck = Deck.first(:id => @deck.id)

      @deck.should have(1).piles
    end
  end

end
