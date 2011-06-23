class Pile
  include MongoMapper::EmbeddedDocument

  MAINDECK = 'maindeck'
  SIDEBOARD = 'sideboard'

  key :name, String, :default => ''
  many :runs

  def <<(run)
    runs = [] if runs.nil?
    self.runs << run
  end

  def destroy
    raise 'Cannot delete maindeck' if name == MAINDECK
    Deck.pull(_parent_document.id, :piles => {:_id => id})
  end

  def nonlands
    self.runs.reject { |r| r.cardtype =~ Card::LAND_REGEX }
  end

  def lands
    self.runs.select { |r| r.cardtype =~ Card::LAND_REGEX }
  end

  def creatures
    self.runs.select { |r| r.cardtype =~ Card::CREATURE_REGEX }
  end

  def spells
    self.runs.reject do |r|
      r.cardtype =~ Card::CREATURE_REGEX || r.cardtype =~ Card::LAND_REGEX
    end
  end

  def count
    self.runs.sum { |r| r.count }
  end

end
