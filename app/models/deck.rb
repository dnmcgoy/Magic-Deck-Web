class Deck
  include MongoMapper::Document

  key :name, String
  key :maindeck, Pile
  key :sideboard, Pile
  timestamps!

  belongs_to :user

  before_save :init_piles

  def init_piles
    @maindeck ||= Pile.new(:name => 'maindeck')
    @sideboard ||= Pile.new(:name => 'sideboard')    
  end

  def mana_curve_chart
    google_chart_base_url = "http://chart.apis.google.com/chart?"
    parameters = []
    parameters << "chs=200x200"
    parameters << "chco=76A4FB"
    parameters << "cht=bvs"
    parameters << "chtt=Mana+Curve"
    parameters << "chxt=x,y"
    google_chart_base_url + parameters.concat(calculated_chart_params).join("&")
  end

  def calculated_chart_params
    cmcs = cmc_values
    x_range = [0, 1, cmcs.length]
    y_range = [1, 0, cmcs.sort.last.to_i+1]
    scale = [0, cmcs.sort.last.to_i+1]
    ["chd=t:#{cmcs.join(',')}",
     "chxr=#{x_range.join(',')}|#{y_range.join(',')}",
     "chds=#{scale.join(',')}"]
  end

  def mana_curve_alt
    "cost_curve:#{cmc_values}"
  end

  def cmc_values
    return [] if maindeck.nonlands.length == 0

    dataset = {}
    maindeck.nonlands.each do |r|
      next if r.cmc.nil?
      if dataset.has_key?(r.cmc)
        dataset[r.cmc] += r.count 
      else
        dataset[r.cmc] = r.count
      end
    end
    high = dataset.keys.sort.last
    (1..high).each do |i|
      if !dataset.has_key?(i)
        dataset[i] = 0
      end
    end
    dataset.sort.map { |key,value|
      value
    }
  end

  def colors
    maindeck.runs.map do |run|
      next if run.cc.blank?
      run.cc.downcase.scan(/[a-z]/)
    end.flatten.compact.uniq.to_s.upcase
  end

  def count
    maindeck.count
  end

  def self.recently_updated

    mapReduce = OrderedHash.new
    mapReduce['mapreduce'] = 'decks'
    mapReduce['map'] = <<-JS
      function() {
        var deck = this;
        if (this.maindeck.runs) {
          this.maindeck.runs.forEach(function(run) {
            emit(deck._id, {card_count : run.count, updated_at : deck.updated_at });
          });
        }
      }
    JS
    mapReduce['reduce'] = <<-JS
      function(k, vals) {
        var total = 0;
        for (var i=0; i<vals.length; i++) {
            total += vals[i].card_count;
        }
        return {card_count: total, updated_at: vals[0].updated_at};
      }
    JS

    a = MongoMapper.database.command(mapReduce)
    res = MongoMapper.database.collection(a["result"]).find().to_a
    res = res.sort_by { |x| x["value"]["updated_at"] }[0..4]
    find(res.map { |x| x["_id"] }, :order => "updated_at DSC")

    # :all,
    # :conditions => "card_count >= 60",
    # :order => "updated_at",
    # :limit => "5"
    # ).map(&:_id)

    #Deck.all.select { |d| d.count >= 60 }.sort_by { |d|
    #  d.updated_at
    #}[0..4]
  end

end
