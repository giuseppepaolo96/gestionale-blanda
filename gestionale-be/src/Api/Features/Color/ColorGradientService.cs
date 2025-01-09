//using Api.Features.WebSocket;

//namespace Api.Features.Color
//{
//    public class ColorGradientService
//    {
//        private List<string> _colors = new List<string>
//    {
//        "#FF5733", "#33FF57", "#3357FF", "#FF33A6", "#F5B700", "#22A7F0", "#D35400", "#8E44AD",
//        "#1ABC9C", "#2ECC71", "#E74C3C", "#9B59B6", "#34495E", "#16A085", "#F39C12", "#C0392B"
//    };

//        private List<Gradient> _gradients = new List<Gradient>
//    {
//        new Gradient { GradientId = 1, GradientStyle = "linear-gradient(to right, #FF5733, #33FF57)" },
//        new Gradient { GradientId = 2, GradientStyle = "linear-gradient(to right, #3357FF, #FF33A6)" },
//        new Gradient { GradientId = 3, GradientStyle = "linear-gradient(to right, #F5B700, #22A7F0)" },
//        new Gradient { GradientId = 4, GradientStyle = "linear-gradient(to right, #D35400, #8E44AD)" },
//        new Gradient { GradientId = 5, GradientStyle = "linear-gradient(to right, #1ABC9C, #2ECC71)" },
//        new Gradient { GradientId = 6, GradientStyle = "linear-gradient(to right, #E74C3C, #9B59B6)" },
//        new Gradient { GradientId = 7, GradientStyle = "linear-gradient(to right, #34495E, #16A085)" },
//        new Gradient { GradientId = 8, GradientStyle = "linear-gradient(to right, #F39C12, #C0392B)" }
//    };

//        public List<string> GetColors() => _colors;
//        public List<Gradient> GetGradients() => _gradients;

//        public void AddColor(string color)
//        {
//            if (!_colors.Contains(color))
//                _colors.Add(color);
//        }

//        public void RemoveColor(string color) => _colors.Remove(color);

//        public void AddGradient(Gradient gradient) => _gradients.Add(gradient);

//        public void RemoveGradient(int gradientId)
//        {
//            var gradient = _gradients.FirstOrDefault(g => g.GradientId == gradientId);
//            if (gradient != null)
//                _gradients.Remove(gradient);
//        }
//    }
//}
