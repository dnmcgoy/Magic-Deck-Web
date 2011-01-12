class Pile
  include MongoMapper::EmbeddedDocument

  key :name, String
  many :runs

  def <<(run)
    runs = [] if runs.nil?
    self.runs << run
  end

  def nonlands
    self.runs.select { |r| r.cardtype != 'land' }
  end

  def lands
    self.runs.select { |r| r.cardtype == 'land' }
  end

  def creatures
    self.runs.select { |r| r.cardtype == 'creature' }
  end

  def spells
    self.runs.select { |r| r.cardtype == 'spell' }
  end

  def unknown
    self.runs.select { |r| r.cardtype.blank? }
  end

  def count
    self.runs.sum { |r| r.count }
  end

end
