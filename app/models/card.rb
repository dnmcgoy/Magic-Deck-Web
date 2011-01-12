class Card
  include MongoMapper::Document

  key :name, String
  key :cardtype, String
  key :mtg_id, String
  key :cc, String
  key :cmc, Integer
  timestamps!

  many :runs

  after_create :after_create_callback
  def after_create_callback
    sync_with_gatherer
  end

  def sync_with_gatherer()
    return self if synced

    Rails.logger.info { "Attempting to sync #{name}" }
    gatherer_info = Gatherer.retrieve_gatherer_info(name.gsub(" ", "%20"))
    self.mtg_id = gatherer_info[:mtg_id]
    self.cc = gatherer_info[:cc]
    self.cmc = gatherer_info[:cmc]
    self.cardtype = gatherer_info[:cardtype]
    save()
    self
  end

  def synced
    return !(mtg_id.nil? || mtg_id == "")
  end
end
