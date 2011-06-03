class Card
  include MongoMapper::Document

  CREATURE_REGEX = /^(legendary\s*)?creature/i
  LAND_REGEX = /^(legendary\s|basic\s)?land/i

  key :name, String
  key :cardtype, String
  key :cc, String
  key :cmc, Integer
  key :color, String
  key :power, Integer
  key :toughness, Integer
  timestamps!

  many :runs
  many :printings

  after_create :after_create_callback
  def after_create_callback
    sync_with_gatherer
  end

  def mtg_id
    if(printings.size > 0)
      return printings.first.mtg_id
    else
      return nil
    end
  end

  def sync_with_gatherer()
    return self if synced

    Rails.logger.info { "Attempting to sync #{name}" }
    gatherer_info = Gatherer.retrieve_gatherer_info(name.gsub(" ", "%20"))
    if gatherer_info[:printings]
      for printing in gatherer_info[:printings]
        self.printings << Printing.new({:mtg_id => printing})
      end
    end
    self.cc = gatherer_info[:cc]
    self.cmc = gatherer_info[:cmc]
    self.cardtype = gatherer_info[:cardtype]
    save()
    self
  end

  def synced
    return !(mtg_id.nil? || mtg_id == "")
  end

  def self.autocomplete(term)
    term = term.match(/[A-Za-z][A-Za-z]+.*/)[0]
    all(:name => /^#{term}/i)
  end

end
