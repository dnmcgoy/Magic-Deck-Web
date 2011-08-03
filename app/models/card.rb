class Card
  include MongoMapper::Document

  CREATURE_REGEX = /^(legendary\s*|artifact\s*)?creature/i
  LAND_REGEX = /^(legendary\s|basic\s)?land/i

  key :name, String
  key :cardtype, String
  key :cc, String
  key :cmc, Integer
  key :color, String
  key :power, Integer
  key :toughness, Integer
  key :oracle_text, String
  timestamps!

  many :runs
  many :printings

  ensure_index(:name)

  # after_create :after_create_callback
  # def after_create_callback
  #   sync_with_gatherer
  # end

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
    if match = term.match(/[A-Za-z][A-Za-z]+.*/)
      all(:name => /^#{match[0]}/i)
    else
      []
    end
  end

  def self.simple_search(params)
    # FIXME there is a matter of security in these lines that needs to be
    # looked at.  Executable code can be thrown in here.  VERY BAD. Leaving
    # in main to look for an elegant solution.
    # if match = params[:name].match(/[A-Za-z0-9][A-Za-z0-9]+.*/)
#       all(:name =>/^.*#{match[0]}.*$/i)
#     else
#       []
#     end
    magicSets = MagicSet.where({'short_name' => params[:sets]}).all.map {|magicset| magicset._id}
    conditions = {}
    (conditions['color'] = /[#{params[:color].join("")}]/) if params[:color]
    (conditions['printings.set_id'] =  magicSets) if params[:sets]
    (conditions['printings.rarity'] = params[:rarity]) if params[:rarity]
    (conditions['name'] = /#{params[:name]}/i) if not params[:name].empty?
    (conditions['cardtype'] = /#{params[:type]}/i) if not params[:type].empty?
    (conditions['cardtype'] = /#{params[:subtype]}/i) if not params[:subtype].empty?
    (conditions['oracle_text'] = /#{params[:rules]}/i) if not params[:rules].empty?
    limit(700).all(:conditions => conditions)
  end
end
